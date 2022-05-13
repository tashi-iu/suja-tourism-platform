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
      className={`
  ${size ? "h-" + size + " w-" + size : ""} rounded-full
  `}
    />
  );
}
