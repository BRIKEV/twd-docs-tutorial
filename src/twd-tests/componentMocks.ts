// twd-js/componentMocks.ts
const componentMocks = new Map<string, any>();

export const twdMockComponent = <T extends Record<string, any>>(id: string, component: React.FC<T>) => {
  componentMocks.set(id, component);
};

export const getMockForComponent = (id: string) => componentMocks.get(id);
