import { Fragment } from "react";
import { useMediaQuery } from "react-responsive";
import { useMounted } from "hooks/useMounted";
import { DesktopNotifications } from "./DesktopNotifications";
import { MobileNotifications } from "./MobileNotifications";

const Notifications = () => {
  const hasMounted = useMounted();

  const isDesktop = useMediaQuery({
    query: "(min-width: 1224px)",
  });

  return (
    <Fragment>
      {hasMounted && isDesktop ? (
        <DesktopNotifications />
      ) : (
        <MobileNotifications />
      )}
    </Fragment>
  );
};

export default Notifications;
