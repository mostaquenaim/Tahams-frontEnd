import Link from "next/link";

export const DrawerLinks = (
  ListStyle,
  ListComponent,
  categories,
  genders,
  toggleDrawer,
) => {
  // console.log(categories,'categoriesss');
  const links = (
    <>
      <ListStyle goto="/" pageName="Home" />

      {genders &&
        genders.map((gender, index) => (
          <ListComponent
            isSide={true}
            key={index}
            cat={gender}
            cats={categories}
            ListStyle={ListStyle}
          ></ListComponent>
        ))}
      {categories &&
        categories.length > 0 &&
        categories.map((cat, index) =>
          cat.name != 'Customize' &&
          !cat.isGenderVaried ? (
            <ListComponent
              isSide={true}
              key={index}
              cat={cat}
              ListStyle={ListStyle}
            ></ListComponent>
          ) : (
            ''
          ),
        )}
    </>
  );

  return links;
};
