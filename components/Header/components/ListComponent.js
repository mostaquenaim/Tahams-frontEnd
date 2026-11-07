import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import React, { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import ListListComponent from './components/ListListComponent';

const ListComponent = ({
  cat,
  cats = [],
  ListStyle,
  isSide = false,
  toggleDrawer,
}) => {
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLength, setSubCategoriesLength] = useState(0);
  const [imageUrl, setImageUrl] = useState(cat?.filename || '');

  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    axiosPublic
      .get(`/admin/view-product-sub-category/${cat.id}`)
      .then((res) => {
        setSubCategories(res.data);
        setSubCategoriesLength(
          res.data.filter((item) => item.isDisabled === false).length,
        );
        // console.log(res.data, "13");
      });
  }, []);

  const List = ({
    children,
    parentClass,
    parentName,
    isGenderVaried,
    filename,
  }) => {
    const [openUl, setOpenUl] = useState(false);

    const handleOpenUl = (e) => {
      e.preventDefault();
      setOpenUl((v) => !v);
    };

    // Desktop menus (Men/Women included) open on hover via .ulClass in navStyle.css
    return (
      <div className={`${!isSide && parentClass}`}>
        {parentName != 'Men' && parentName != 'Women' && !isSide ? (
          <a
            href={`/categories/${parentName}`}
            onClick={handleOpenUl}
            className="group"
          >
            <span
              className={`hover:opacity-70 transition-opacity flex gap-1 items-center`}
            >
              {parentName}
              <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown>
            </span>
          </a>
        ) : (
          <span
            onClick={handleOpenUl}
            className="hover:opacity-70 transition-opacity flex gap-1 items-center cursor-pointer"
          >
            {parentName}
            <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown>
          </span>
        )}

        <ul
          data-theme="light"
          className={`${
            isSide
              ? openUl
                ? 'block relative transition-all duration-300 opacity-100 rounded-lg'
                : 'block opacity-0 absolute -z-40'
              : 'hidden w-full left-0 justify-around'
          } ${
            isSide
              ? 'gap-10 p-5 border-white border-2 shadow shadow-black'
              : 'z-30 gap-10 px-10 py-8 border-t border-gray-200 shadow-2xl text-base font-medium normal-case tracking-normal'
          } bg-base-100 absolute`}
        >
          {children}
        </ul>
      </div>
    );
  };

  return (
    <div className="">
      <List
        parentClass={isSide ? 'ulDrawerClass' : 'ulClass'}
        parentName={cat.name}
        isSide={isSide}
        isGenderVaried={cat.isGenderVaried}
        filename={cat.isGenderVaried ? cat.filename : ''}
      >
        {cat.name == 'Men' || cat.name == 'Women' ? (
          cats.map(
            (catItem, index) =>
              catItem.isGenderVaried &&
              ((cat.name == 'Men' && catItem.isForMen) ||
                (cat.name == 'Women' && catItem.isForWomen)) && (
                <ul>
                  <ListComponent
                    isSide={isSide}
                    key={index}
                    cat={catItem}
                    ListStyle={ListStyle}
                  ></ListComponent>
                </ul>
              ),
          )
        ) : (
          <>
            {cat?.filename && !cat?.isGenderVaried && (
              <ul>
                <img
                  className={`hidden w-64 ${isSide ? 'hidden' : ' lg:flex'}`}
                  src={`${imageUrl}` || '/placeholder.jpg'}
                  onError={() =>
                    setImageUrl(
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtySoziKZsJLwj81PGIi1jMRBmzvaaiYWG1Q&s',
                    )
                  }
                />
              </ul>
            )}
            {subCategories.map(
              (catItem, index) =>
                // {
                catItem.isDisabled == false && (
                  <ul>
                    <span className="flex gap-1 items-center pb-3 text-lg font-bold">
                      {' '}
                      {catItem.name}{' '}
                    </span>
                    <ListListComponent
                      ListStyle={ListStyle}
                      sub={catItem}
                    ></ListListComponent>
                  </ul>
                ),
              // }
            )}
          </>
        )}
      </List>
    </div>
  );
};

export default ListComponent;
