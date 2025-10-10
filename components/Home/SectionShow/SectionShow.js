import Heading from '/components/Header/Heading';

const SectionShow = ({ layout, photos, isEditing, onLayoutChange }) => {
  const layoutStyles = {
    style1: {
      container: 'flex flex-col md:grid md:grid-cols-5 md:grid-rows-2 gap-4',
      items: [
        { span: 'col-span-2 row-span-2', index: 0 },
        { span: 'col-span-3 row-span-1', index: 1 },
        { span: 'col-span-1 row-span-1', index: 2 },
        { span: 'col-span-1 row-span-1', index: 3 },
        { span: 'col-span-1 row-span-1', index: 4 },
      ],
    },
    style6: {
      container: 'flex flex-col md:grid md:grid-cols-5 md:grid-rows-2 gap-4',
      items: [
        { span: 'col-span-1 md:col-span-2 row-span-2', index: 0 },
        { span: 'col-span-1', index: 1 },
        { span: 'col-span-1', index: 2 },
        { span: 'col-span-1', index: 3 },
        { span: 'col-span-1', index: 4 },
        { span: 'col-span-1', index: 5 },
        { span: 'col-span-1', index: 6 },
      ],
    },
    style2: {
      container: 'grid grid-cols-3 gap-4',
      items: [
        { span: 'col-span-2 row-span-2', index: 0 },
        { span: 'col-span-1', index: 1 },
        { span: 'col-span-1', index: 2 },
        { span: 'col-span-1', index: 3 },
        { span: 'col-span-2', index: 4 },
      ],
    },
    style3: {
      container: 'grid grid-cols-4 gap-4',
      items: [
        { span: 'col-span-2', index: 0 },
        { span: 'col-span-2', index: 1 },
        { span: 'col-span-1', index: 2 },
        { span: 'col-span-1', index: 3 },
        { span: 'col-span-2', index: 4 },
      ],
    },
    style4: {
      container: 'grid grid-cols-2 md:grid-cols-4 gap-4',
      items: [
        { span: 'col-span-1', index: 0 },
        { span: 'col-span-1', index: 1 },
        { span: 'col-span-1', index: 2 },
        { span: 'col-span-1', index: 3 },
        { span: 'col-span-2 md:col-span-4', index: 4 },
      ],
    },
    style5: {
      container: 'grid grid-cols-1 md:grid-cols-3 gap-4',
      items: [
        { span: 'col-span-1', index: 0 },
        { span: 'col-span-1', index: 1 },
        { span: 'col-span-1', index: 2 },
        { span: 'col-span-1', index: 3 },
      ],
    },
  };

  const currentLayout = layoutStyles[layout] || layoutStyles['style1'];
  const displayPhotos = photos.slice(0, currentLayout.items.length);

  return (
    <div className="space-y-6 p-4">
      <Heading first="Featured Collection" second="Our Products" theme="dark" />

      <div className={currentLayout.container}>
        {currentLayout.items.map(
          (item, idx) =>
            displayPhotos[item.index] && (
              <div key={idx} className={`${item.span} relative group`}>
                <img
                  src={displayPhotos[item.index]}
                  alt={`photo ${item.index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {isEditing && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {item.index + 1}
                  </div>
                )}
              </div>
            ),
        )}
      </div>
    </div>
  );
};

export default SectionShow;
