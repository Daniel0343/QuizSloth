package com.quizsloth.service;

import com.quizsloth.model.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Evidencia 2: Integración con Odoo via XML-RPC.
 *
 * Flujo:
 *  1. authenticate() — obtiene el uid del usuario admin en Odoo.
 *  2. crearCliente()  — crea un res.partner para el alumno y un sale.order mensual.
 *  3. crearFacturaMensual() — genera la factura mensual automática.
 */
@Slf4j
@Service
public class OdooService {

    @Value("${odoo.url}")
    private String odooUrl;

    @Value("${odoo.db}")
    private String odooDb;

    @Value("${odoo.user}")
    private String odooUser;

    @Value("${odoo.password}")
    private String odooPassword;

    private static final double PRECIO_MENSUAL = 29.99;
    private static final String PRODUCT_NAME = "Suscripción QuizSloth";

    // ----------------------------------------------------------------
    // Autenticación
    // ----------------------------------------------------------------

    private int authenticate() throws Exception {
        XmlRpcClient client = buildClient("/xmlrpc/2/common");
        Object uid = client.execute("authenticate",
                List.of(odooDb, odooUser, odooPassword, new HashMap<>()));
        if (uid == null || (int) uid == 0) {
            throw new RuntimeException("Autenticación Odoo fallida");
        }
        return (int) uid;
    }

    // ----------------------------------------------------------------
    // Crear cliente (alumno) en Odoo
    // ----------------------------------------------------------------

    /**
     * Crea un res.partner en Odoo con los datos del alumno.
     * @return ID del partner creado en Odoo.
     */
    public Integer crearCliente(Usuario alumno) throws Exception {
        int uid = authenticate();
        XmlRpcClient client = buildClient("/xmlrpc/2/object");

        Map<String, Object> partner = new HashMap<>();
        partner.put("name", alumno.getNombre());
        partner.put("email", alumno.getEmail());
        partner.put("customer_rank", 1);
        partner.put("comment", "Alumno registrado desde QuizSloth");

        Object result = client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "res.partner", "create",
                List.of(partner)
        ));

        int partnerId = (int) result;
        log.info("Alumno {} registrado en Odoo como partner ID={}", alumno.getEmail(), partnerId);

        // Crear factura mensual automática
        crearFacturaMensual(uid, client, partnerId);

        return partnerId;
    }

    // ----------------------------------------------------------------
    // Crear factura mensual automática
    // ----------------------------------------------------------------

    /**
     * Genera un sale.order para el alumno y lo confirma (flujo de ventas).
     */
    private void crearFacturaMensual(int uid, XmlRpcClient client, int partnerId) throws Exception {
        // Buscar o crear el producto de suscripción
        Object productSearch = client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "product.product", "search",
                List.of(List.of(List.of("name", "=", PRODUCT_NAME)))
        ));

        int productId;
        Object[] productos = (Object[]) productSearch;
        if (productos.length > 0) {
            productId = (int) productos[0];
        } else {
            Map<String, Object> product = new HashMap<>();
            product.put("name", PRODUCT_NAME);
            product.put("type", "service");
            product.put("list_price", PRECIO_MENSUAL);
            Object created = client.execute("execute_kw", List.of(
                    odooDb, uid, odooPassword,
                    "product.product", "create",
                    List.of(product)
            ));
            productId = (int) created;
        }

        // Crear sale.order
        Map<String, Object> order = new HashMap<>();
        order.put("partner_id", partnerId);
        order.put("note", "Facturación mensual automática - QuizSloth");

        Object orderId = client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "sale.order", "create",
                List.of(order)
        ));

        // Añadir línea de pedido
        Map<String, Object> orderLine = new HashMap<>();
        orderLine.put("order_id", (int) orderId);
        orderLine.put("product_id", productId);
        orderLine.put("product_uom_qty", 1);
        orderLine.put("price_unit", PRECIO_MENSUAL);

        client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "sale.order.line", "create",
                List.of(orderLine)
        ));

        // Confirmar el pedido
        client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "sale.order", "action_confirm",
                List.of(List.of((int) orderId))
        ));

        log.info("Factura mensual creada en Odoo para partner ID={}", partnerId);
    }

    // ----------------------------------------------------------------
    // Actualizar odoo_id si se pierde la referencia
    // ----------------------------------------------------------------

    public Integer buscarClientePorEmail(String email) throws Exception {
        int uid = authenticate();
        XmlRpcClient client = buildClient("/xmlrpc/2/object");

        Object result = client.execute("execute_kw", List.of(
                odooDb, uid, odooPassword,
                "res.partner", "search",
                List.of(List.of(List.of("email", "=", email)))
        ));

        Object[] ids = (Object[]) result;
        return ids.length > 0 ? (int) ids[0] : null;
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private XmlRpcClient buildClient(String endpoint) throws Exception {
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + endpoint));
        config.setEnabledForExtensions(true);
        config.setConnectionTimeout(10_000);
        config.setReplyTimeout(10_000);
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);
        return client;
    }
}
