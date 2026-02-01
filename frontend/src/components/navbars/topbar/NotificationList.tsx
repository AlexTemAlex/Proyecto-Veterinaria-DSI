import SimpleBar from "simplebar-react";
import { ListGroup, Row, Col } from "react-bootstrap";
import { AppNotification, TIPO_ICONS } from "context/NotificationContext";

interface NotificationListProps {
  notifications: AppNotification[];
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  return `Hace ${diffDays}d`;
};

const ACCION_COLORS: Record<AppNotification["accion"], string> = {
  agregar: "text-success",
  editar: "text-warning",
  eliminar: "text-danger",
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-muted">
        <i className="fe fe-bell-off mb-2" style={{ fontSize: "1.5rem" }}></i>
        <p className="mb-0">No hay notificaciones</p>
      </div>
    );
  }

  return (
    <SimpleBar style={{ maxHeight: "300px" }}>
      <ListGroup variant="flush">
        {notifications.map((item) => (
          <ListGroup.Item
            key={item.id}
            className={!item.leida ? "bg-light" : ""}
          >
            <Row className="align-items-center">
              <Col xs="auto">
                <i
                  className={`fe fe-${TIPO_ICONS[item.tipo]} ${ACCION_COLORS[item.accion]}`}
                  style={{ fontSize: "1.2rem" }}
                ></i>
              </Col>
              <Col>
                <p className="mb-0 fw-semi-bold">{item.mensaje}</p>
                <small className="text-muted">
                  {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)} &middot;{" "}
                  {formatTimeAgo(item.fecha)}
                </small>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </SimpleBar>
  );
};
