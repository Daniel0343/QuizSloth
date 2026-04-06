import React, { forwardRef } from 'react';

export const View = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return <div ref={ref} {...props} />;
});
View.displayName = 'View';

export const Text = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => {
  return <span ref={ref} {...props} />;
});
Text.displayName = 'Text';

export const ScrollView = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return <div ref={ref} {...props} style={{ overflowY: 'auto', ...props.style }} />;
});
ScrollView.displayName = 'ScrollView';

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  return <input ref={ref} {...props} />;
});
TextInput.displayName = 'TextInput';

export const TouchableOpacity = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  return <button ref={ref} {...props} className={`cursor-pointer active:opacity-70 transition-opacity ${props.className || ''}`} />;
});
TouchableOpacity.displayName = 'TouchableOpacity';

export const Image = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>((props, ref) => {
  return <img ref={ref} {...props} />;
});
Image.displayName = 'Image';

export function FlatList<T>({ 
  data, 
  renderItem, 
  keyExtractor,
  className,
  ...props 
}: { 
  data: T[], 
  renderItem: ({ item, index }: { item: T, index: number }) => React.ReactNode, 
  keyExtractor: (item: T, index: number) => string,
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ScrollView className={className} {...props}>
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem({ item, index })}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}
