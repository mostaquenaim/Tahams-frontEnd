import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import ShowBanners from './components/ShowBanner';
import NavbarComp from './components/Navbar';

export const CompanyContext = createContext(null); {/* unused  */}

export default function Home() {

  // const [company, setCompany] = useState(null)

  // const loadCompanyInfo = async () => {
  //   const resp = await axios.get('/company.json')
  //   setCompany(resp.data)
  // }

  // useEffect(() => {
  //   loadCompanyInfo();
  // }, [])

  return (
    <>
    
      <CompanyContext.Provider value='unused'> {/* unused  */}
        <NavbarComp />
        <ShowBanners />
      </CompanyContext.Provider> {/* unused  */}
    </>
  ); 


}


