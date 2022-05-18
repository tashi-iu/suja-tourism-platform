type AvatarProps = {
  src: string;
  alt: string;
  size?: number;
};

export default function Avatar({ src, alt, size }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        height: size,
        width: size,
      }}
      className={`rounded-full`}
    />
  );
}
