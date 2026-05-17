import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import React, { useEffect, useRef, useState } from 'react';
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

  const isGenderItem = cat.name === 'Men' || cat.name === 'Women';

  const List = ({
    children,
    parentClass,
    parentName,
    isGenderVaried,
    filename,
  }) => {
    const [openUl, setOpenUl] = useState(false);
    const wrapperRef = useRef(null);

    const handleOpenUl = (e) => {
      e.preventDefault();
      setOpenUl((v) => !v);
    };

    // Close on outside click OR when hovering a sibling nav item
    useEffect(() => {
      if (!isGenderItem || isSide) return;

      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setOpenUl(false);
        }
      };

      // Close when mouse enters another item in the same nav <ul>
      const handleSiblingHover = (e) => {
        if (!wrapperRef.current || wrapperRef.current.contains(e.target)) return;
        const navUl = wrapperRef.current.closest('ul');
        if (navUl && navUl.contains(e.target)) {
          setOpenUl(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('mouseover', handleSiblingHover);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('mouseover', handleSiblingHover);
      };
    }, []);

    // Desktop Men/Women: click-controlled class; others: CSS hover via ulClass
    const desktopClass = isGenderItem
      ? 'ulClassClick'
      : parentClass;

    return (
      <div ref={wrapperRef} className={`${!isSide && desktopClass}`}>
        {parentName != 'Men' && parentName != 'Women' && !isSide ? (
          <a
            href={`/categories/${parentName}`}
            onClick={handleOpenUl}
            className="group"
          >
            <span
              className={`hover:font-extrabold hover:scale-105 transition-all flex gap-1 items-center`}
            >
              {parentName}
              <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown>
            </span>
          </a>
        ) : (
          <span
            onClick={handleOpenUl}
            className="hover:font-extrabold hover:scale-105 transition-all flex gap-1 items-center cursor-pointer"
          >
            {parentName}
            <MdOutlineKeyboardArrowDown
              className={`transition-transform duration-200 ${openUl ? 'rotate-180' : ''}`}
            />
          </span>
        )}

        <ul
          data-theme="light"
          className={`${
            isSide
              ? openUl
                ? 'block relative transition-all duration-300 opacity-100 rounded-lg'
                : 'block opacity-0 absolute -z-40'
              : isGenderItem
                ? openUl
                  ? 'flex w-full left-0 justify-around'
                  : 'hidden w-full left-0 justify-around'
                : 'hidden w-full left-0 justify-around'
          } gap-10 p-5 bg-base-100 absolute border-white border-2 shadow shadow-black`}
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
