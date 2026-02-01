import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

const BASE = "/dashboard";

export const DashboardMenu: DashboardMenuProps[] = [
  {id: uuid(), title: "Dashboard", icon: "home", link: `${BASE}`, 
  },
  {
    id: uuid(), title: "Inventario", icon: "package", link: `${BASE}/inventario`,
  },
  {
    id: uuid(), title: "Documentos", icon: "file-text", link: `${BASE}/documentos`,
  },
  {
    id: uuid(), title: "Citas", icon: "calendar", link: `${BASE}/citas`,
  },
];
