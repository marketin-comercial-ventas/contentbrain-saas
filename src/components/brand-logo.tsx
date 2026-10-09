import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function BrandLogo({ className = "", imageClassName = "", priority = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/cfdigital-logo.png"
        alt="CFDIGITAL"
        width={220}
        height={70}
        priority={priority}
        className={`h-auto w-[150px] object-contain ${imageClassName}`}
      />
    </div>
  );
}
