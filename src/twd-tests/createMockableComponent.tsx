import { getMockForComponent } from "./componentMocks";

interface MockedComponentProps {
  name: string;
  children: React.ReactElement;
}

export const MockedComponent = ({ name, children }: MockedComponentProps) => {
  const Mock = getMockForComponent(name);

  if (Mock) return <Mock {...children.props} />;

  return children;
};
