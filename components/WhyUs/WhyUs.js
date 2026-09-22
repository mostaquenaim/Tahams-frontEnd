import Heading from '../Header/Heading';

const WhyUs = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid items-center gap-10 md:grid-cols-5">
        <div className="text-center md:col-span-3 md:text-left">
          <Heading first="Why Tahams?" second="The unique way of life" center={false} className="text-center md:text-left" />
          <p className="mt-6 text-base leading-relaxed text-gray-600 sm:text-lg">
            At Tahams, we take immense pride in offering you the finest
            clothing and accessories. Our unwavering commitment to excellence
            sets us apart.
          </p>
        </div>

        <div className="md:col-span-2">
          <img
            className="mx-auto h-auto w-full max-w-sm"
            src="/why-tahams-pic.png"
            alt="Tahams"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
