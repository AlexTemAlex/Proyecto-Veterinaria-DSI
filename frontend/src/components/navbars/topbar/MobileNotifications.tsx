import { Link } from "react-router-dom";
import { ListGroup, Dropdown, Badge, Image } from "react-bootstrap";
import { useNotifications } from "context/NotificationContext";
import { NotificationList } from "./NotificationList";

export const MobileNotifications = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } =
    useNotifications();

  return (
    <ListGroup
      as="ul"
      bsPrefix="navbar-nav"
      className="navbar-right-wrap ms-auto d-flex nav-top-wrap"
    >
      <Dropdown as="li" className="stopevent">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          id="dropdownNotification"
          className="btn btn-light btn-icon rounded-circle text-muted position-relative"
          onClick={markAllAsRead}
        >
          <i className="fe fe-bell"></i>
          {unreadCount > 0 && (
            <Badge
              pill
              bg="danger"
              className="position-absolute"
              style={{ top: -2, right: -2, fontSize: "0.65rem" }}
            >
              {unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
          aria-labelledby="dropdownNotification"
          align="end"
        >
          <Dropdown.Item className="mt-3" bsPrefix=" " as="div">
            <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
              <span className="h4 mb-0">Notificaciones</span>
              {notifications.length > 0 && (
                <Link
                  to="#"
                  className="text-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    clearNotifications();
                  }}
                >
                  <span className="align-middle">
                    <i className="fe fe-trash-2 me-1"></i>
                    Limpiar
                  </span>
                </Link>
              )}
            </div>
            <NotificationList notifications={notifications} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown as="li" className="ms-2">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          className="rounded-circle"
          id="dropdownUser"
        >
          <div className="avatar avatar-md avatar-indicators avatar-online">
            <Image
              alt="avatar"
              src="/images/avatar/avatar-1.jpg"
              className="rounded-circle"
            />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dropdown-menu dropdown-menu-end"
          align="end"
          aria-labelledby="dropdownUser"
        >
          <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=" ">
            <div className="lh-1">
              <h5 className="mb-1">Admin</h5>
            </div>
            <div className="dropdown-divider mt-3 mb-2"></div>
          </Dropdown.Item>
          <Dropdown.Item
            as={Link}
            to="/auth/sign-in"
            className="text-danger"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
            }}
          >
            <i className="fe fe-power me-2"></i>Cerrar sesión
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ListGroup>
  );
};
