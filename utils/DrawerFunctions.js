export const DrawerLinks = (ListStyle, ListComponent, categories, genders, toggleDrawer) => {
    const links = (
        <>
            <ListStyle goto='/' pageName='Home' />

            {
                genders &&
                genders.map((gender, index) => (
                    <ListComponent isSide={true} key={index} cat={gender} cats={categories} ListStyle={ListStyle}></ListComponent>
                ))
            }
            {
                categories &&
                categories.map((cat, index) => (
                    !cat.isGenderVaried ?
                        <ListComponent isSide={true} key={index} cat={cat} ListStyle={ListStyle}></ListComponent>
                        :
                        ''
                ))
            }
        </>
    )
    
    return links
}