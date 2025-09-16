import Image from "next/image";

export function HealthLogo() {
  return (
    <div className="">
      <Image src="/health.png" width={64} height={64} alt="Logo eafit" />
    </div>
  );
}
