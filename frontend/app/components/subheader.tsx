type SubHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SubHeader({ title, subtitle }: SubHeaderProps) {
  return (
    <section className="w-full bg-[#65539e] font-sans">
      <div className="mx-auto max-w-7xl text-center px-4 py-4 sm:px-4 sm:py-4 lg:py-4">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-xl lg:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-sky-200 sm:text-base lg:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
