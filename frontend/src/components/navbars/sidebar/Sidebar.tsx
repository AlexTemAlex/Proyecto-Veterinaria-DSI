// import node module libraries
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
import { Accordion } from "react-bootstrap";

// import simple bar scrolling used for notification item scrolling
import SimpleBar from "simplebar-react";

// import routes file
import { DashboardMenu } from "routes/DashboardRoutes";
import { DashboardMenuProps } from "types";

interface SidebarProps {
  showMenu: boolean;       // controla si el sidebar está abierto
  toggleMenu: () => void;  // función para abrir/cerrar sidebar
}

const Sidebar: React.FC<SidebarProps> = ({ showMenu, toggleMenu }) => {
  const location = useLocation();

  const generateLink = (item: any) => (
    <Link
      to={item.link || "#"}
      className={`nav-link ${location.pathname === item.link ? "active" : ""}`}
      onClick={() => {
        if (window.innerWidth < 768) toggleMenu(); // cierra sidebar en móvil
      }}
    >
      {item.icon && <i className={`nav-icon fe fe-${item.icon} me-2`}></i>}
      {item.title || item.name}
      {item.badge && (
        <Badge className="ms-1" bg={item.badgecolor || "primary"}>
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  return (
    <Fragment>
      <SimpleBar
        style={{
          height: "100vh",
          position: "fixed",
          width: "250px",
        }}
      >
        {/* Logo */}
        <div className="nav-scroller" style={{ display: "flex", justifyContent: "center", padding: "1.5rem 1rem" }}>
          <img src="/images/brand/logo/logo.svg" alt="PETSI" style={{ height: "3rem" }} />
        </div>

        {/* Dashboard Menu */}
        <Accordion
          defaultActiveKey="0"
          as="ul"
          className="navbar-nav flex-column px-2"
        >
          {DashboardMenu.map((menu: DashboardMenuProps) => {
            if (menu.grouptitle) {
              return (
                <Card bsPrefix="nav-item" key={menu.id}>
                  <div className="navbar-heading px-3 py-2">{menu.title}</div>
                </Card>
              );
            }

            if (menu.children) {
              return (
                <Accordion.Item eventKey={menu.id} as="li" bsPrefix="nav-item" key={menu.id}>
                  <Accordion.Header>{menu.title}</Accordion.Header>
                  <Accordion.Body as="ul" className="nav flex-column ps-3">
                    {menu.children.map((child) => (
                      <li key={child.id} className="nav-item">
                        {generateLink(child)}
                      </li>
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              );
            }

            return (
              <li key={menu.id} className="nav-item">
                {generateLink(menu)}
              </li>
            );
          })}
        </Accordion>

        {/* Cerrar sesión */}
        <ul className="navbar-nav flex-column px-2 pb-4">
          <li className="nav-item">
            <Link
              to="/auth/sign-in"
              className="nav-link text-danger"
              style={{ paddingLeft: "1rem", paddingRight: "0.5rem" }}
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
              }}
            >
              <i className="nav-icon fe fe-log-out me-2"></i>
              Cerrar sesión
            </Link>
          </li>
        </ul>
      </SimpleBar>
    </Fragment>
  );
};

export default Sidebar;
