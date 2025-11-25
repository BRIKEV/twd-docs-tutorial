import { createBrowserRouter } from "react-router";
import Helloworld from "./pages/Helloworld/Helloworld";
import TodoList from "./pages/TodoList/TodoList";
import QRScanner from "./pages/QRScanner/QRScanner";
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
    path: "*",
    element: <div>Not Found</div>,
  },
]);

export default AppRoutes;
