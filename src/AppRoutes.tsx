import { createBrowserRouter } from "react-router";
import Helloworld from "./pages/Helloworld/Helloworld";
import TodoList from "./pages/TodoList/TodoList";
import QRScanner from "./pages/QRScanner/QRScanner";
import Landing from "./pages/Landing/Landing"; // SPIKE
import { loadTodos } from "./pages/TodoList/loader";
import { todoActions } from "./pages/TodoList/action";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    Component: Helloworld,
  },
  {
    path: "/todos",
    loader: loadTodos,
    action: todoActions,
    Component: TodoList,
  },
  {
    path: "/qr-scanner",
    Component: QRScanner,
  },
  {
    path: "/landing-a",
    element: <Landing variant="a" />,
  },
  {
    path: "/landing-b",
    element: <Landing variant="b" />,
  },
  {
    path: "/landing-c",
    element: <Landing variant="c" />,
  },
  {
    path: "/testin-library",
    element: <div>Testin Library</div>,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);

export default AppRoutes;
