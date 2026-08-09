import Image from "next/image";

function gradientFromSeed(seed: number): string {
  const hue = Math.abs(seed * 47.5) % 360;
  return `linear-gradient(135deg, hsl(${hue} 75% 32%), hsl(${(hue + 70) % 360} 80% 22%), hsl(${(hue + 140) % 360} 85% 14%))`;
}

export default function Banner({
  image,
  title,
  seed,
  className = "",
}: {
  image: string | null;
  title: string;
  seed: number;
  className?: string;
}) {
  if (image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={image} alt={`${title} banner`} fill sizes="100vw" className="object-cover" priority />
      </div>
    );
  }
  return <div className={className} style={{ background: gradientFromSeed(seed) }} aria-hidden />;
}