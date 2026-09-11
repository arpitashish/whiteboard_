import { createContext } from "react";

const boardContext = createContext({
  activeToolItem: "",
  toolActionType: "",
  elements: [],
  history: [[]],
  index: 0,
  canvasId: "",

  setElements: () => {},
  boardMouseDownHandler: () => {},
  setCanvasId: () => {},
  changeToolHandler: () => {},
  boardMouseMoveHandler: () => {},
  boardMouseUpHandler: () => {},
  setHistory: () => {},
});

export default boardContext;