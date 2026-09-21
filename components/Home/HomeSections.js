import { useState } from 'react';
import Heading from '/components/Header/Heading';
import ShowProductSmall from '/components/Product/ShowProductSmall';

// Phones show a shorter list per section until the customer asks for more.
const MOBILE_LIMIT = 16;

const HomeSection = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  const { products } = section;
  const hiddenOnMobile = products.length - MOBILE_LIMIT;

  return (
    <div className="pt-10 md:pt-16 lg:pt-10 space-y-8 py-12 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="px-2 md:px-10">
        <Heading first={section.eyebrow || ''} second={section.title} />
      </div>

      <div className="pt-10 pb-6 flex justify-center">
        <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {products.map((item, index) => (
            <div
              key={item.id}
              className={
                !expanded && index >= MOBILE_LIMIT ? 'hidden lg:block' : ''
              }
            >
              <ShowProductSmall item={item} />
            </div>
          ))}
        </div>
      </div>

      {hiddenOnMobile > 0 && !expanded && (
        <div className="flex justify-center lg:hidden">
          <button
            onClick={() => setExpanded(true)}
            className="px-6 py-2 border border-black text-black hover:bg-black hover:text-white transition rounded-xl font-medium"
          >
            Show {hiddenOnMobile} more
          </button>
        </div>
      )}
    </div>
  );
};

// Admin-curated product rows (Admin › Promotions › Home Page Sections).
const HomeSections = ({ sections = [] }) =>
  sections.map((section) => (
    <section key={section.id} id={`home-section-${section.id}`}>
      <HomeSection section={section} />
    </section>
  ));

export default HomeSections;
