//import node module libraries
import { Outlet } from "react-router";
import Sidebar from "components/navbars/sidebar/Sidebar";
import Header from "components/navbars/topbar/Header";
import { useState } from "react";

const RootLayout = () => {
  const [showMenu, setShowMenu] = useState(true);
  const ToggleMenu = () => {
    return setShowMenu(!showMenu);
  };

  return (

      <div
        id="db-wrapper"
        className={`${showMenu ? "" : "toggled"}`}
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#e3e5ec", // color global
        }}
      >
        {/* Sidebar */}
        <div className="navbar-vertical navbar">
          <Sidebar showMenu={showMenu} toggleMenu={ToggleMenu} />
        </div>

        {/* Contenido de la página */}
        <div
          id="page-content"
          style={{
            marginLeft: showMenu ? "250px" : "0px", // deja espacio para el sidebar
            width: showMenu ? "calc(100% - 250px)" : "100%",
            transition: "margin-left 0.3s ease, width 0.3s ease",
            padding: "20px 30px", // padding superior/inferior 20px, costados 30px
            boxSizing: "border-box", // para que el padding no rompa el width
          }}
        >
          <div className="header">
            <Header toggleMenu={ToggleMenu} />
          </div>
          <Outlet />
        </div>
      </div>


  );
};

export default RootLayout;
