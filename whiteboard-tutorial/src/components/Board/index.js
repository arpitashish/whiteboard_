import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import rough from "roughjs";

import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";

import toolboxContext from "../../store/toolbox-context";
import socket from "../../utils/socket";

import classes from "./index.module.css";

import { getSvgPathFromStroke } from "../../utils/element";
import getStroke from "perfect-freehand";

function Board({ id }) {
  const canvasRef = useRef();
  const textAreaRef = useRef();

  const {
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo,
    setCanvasId,
    setElements,
    setHistory,
  } = useContext(boardContext);

  const { toolboxState } = useContext(toolboxContext);

  // Join canvas and receive canvas data
  useEffect(() => {
    if (!id) return;

    setCanvasId(id);

    socket.emit("joinCanvas", {
      canvasId: id,
    });

    socket.on("loadCanvas", (initialElements) => {
      setElements(initialElements || []);
      setHistory(initialElements || []);
    });

    socket.on("receiveDrawingUpdate", (updatedElements) => {
      setElements(updatedElements || []);
    });

    return () => {
      socket.off("loadCanvas");
      socket.off("receiveDrawingUpdate");
    };
  }, [id, setCanvasId, setElements, setHistory]);

  // Send drawing changes to the server
  useEffect(() => {
    if (!id) return;

    socket.emit("drawingUpdate", {
      canvasId: id,
      elements,
    });
  }, [elements, id]);

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  // Draw elements on canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (!element) return;

      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;

        case TOOL_ITEMS.BRUSH: {
          context.fillStyle = element.stroke;

          const path = new Path2D(
            getSvgPathFromStroke(getStroke(element.points))
          );

          context.fill(path);
          break;
        }

        case TOOL_ITEMS.TEXT:
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(
            element.text || "",
            element.x1,
            element.y1
          );
          break;

        default:
          break;
      }
    });
  }, [elements]);

  // Focus textarea when writing
  useEffect(() => {
    const textarea = textAreaRef.current;

    if (toolActionType === TOOL_ACTION_TYPES.WRITING && textarea) {
      textarea.focus();
    }
  }, [toolActionType]);

  const handleMouseDown = (event) => {
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    boardMouseMoveHandler(event);
  };

  const handleMouseUp = () => {
    boardMouseUpHandler();
  };

  // Download canvas as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");

    link.download = `whiteboard-${id || "canvas"}.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  return (
    <>
     <button
  onClick={handleDownload}
  style={{
    position: "fixed",
    top: "20px",
    right: "180px",
    zIndex: 1000,
    padding: "10px 16px",
    cursor: "pointer",
  }}
>
  
</button>

     {toolActionType === TOOL_ACTION_TYPES.WRITING &&
  elements.length > 0 && (
    <textarea
      type="text"
      ref={textAreaRef}
      autoFocus
      className={classes.textElementBox}
      style={{
        top: elements[elements.length - 1]?.y1 || 0,
        left: elements[elements.length - 1]?.x1 || 0,
        fontSize: `${elements[elements.length - 1]?.size || 16}px`,
        color: elements[elements.length - 1]?.stroke || "black",
        zIndex: 1001,
        pointerEvents: "auto",
      }}
      onBlur={(event) =>
        textAreaBlurHandler(event.target.value)
      }
    />
  )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;