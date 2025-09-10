import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import React, { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import ListListComponent from './components/ListListComponent';
import Link from 'next/link';

const ListComponent = ({
  cat,
  cats = [],
  ListStyle,
  isSide = false,
  toggleDrawer,
}) => {
  // console.log(cat, 'catt');
  // console.log(cats, 78);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLength, setSubCategoriesLength] = useState(0);

  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    // if (cat.name != 'Men' && cat.name != 'Women') {
    axiosPublic
      .get(`/admin/view-product-sub-category/${cat.id}`)
      .then((res) => {
        setSubCategories(res.data);
        setSubCategoriesLength(
          res.data.filter((item) => item.isDisabled === false).length,
        );
        // console.log(res.data, "13");
      });
    // }
  }, []);

  const List = ({ children, parentClass, parentName }) => {
    const [openUl, setOpenUl] = useState(null);

    const handleOpenUl = () => {
      setOpenUl(!openUl);
    };
    return (
      <div className={`${!isSide && parentClass}`}>
        {parentName != 'Men' && parentName != 'Women' && !isSide? (
          <a
            href={`/categories/${parentName}`}
            onClick={handleOpenUl}
            className="hover:font-extrabold hover:scale-105 duration-300 transition-all  flex gap-1 items-center"
          >
            {parentName}
            <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown>
          </a>
        ) : (
          <span
            onClick={handleOpenUl}
            className="hover:font-extrabold hover:scale-105 duration-300 transition-all  flex gap-1 items-center"
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
                ? ' block relative transition-all duration-300 opacity-100 rounded-lg'
                : ' block opacity-0 absolute -z-40'
              : 'hidden w-full left-0 justify-around'
          }
           gap-10 p-5 bg-base-100 absolute border-white border-2 shadow shadow-black`}
        >
          {/*  */}
          {/* */}
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
      >
        {cat.name == 'Men' || cat.name == 'Women' ? (
          cats.map(
            (catItem, index) =>
              catItem.isGenderVaried &&
              (cat.name == 'Men' && catItem.isForMen ? (
                <ul>
                  {/* <span className='flex gap-1 items-center pb-3 text-lg font-bold'> {catItem.name} </span> */}
                  <ListComponent
                    isSide={isSide}
                    key={index}
                    cat={catItem}
                    ListStyle={ListStyle}
                  ></ListComponent>
                </ul>
              ) : (
                cat.name == 'Women' &&
                catItem.isForWomen && (
                  <ul>
                    <ListComponent
                      isSide={isSide}
                      key={index}
                      cat={catItem}
                      ListStyle={ListStyle}
                    ></ListComponent>
                  </ul>
                )
              )),
          )
        ) : (
          <>
            {cat?.filename && !cat?.isGenderVaried && (
              <ul>
                <img
                  className={`hidden w-64 ${isSide ? 'hidden' : ' lg:flex'}`}
                  src={`${cat?.filename}` || '/placeholder.jpg'}
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
