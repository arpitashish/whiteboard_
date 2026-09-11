import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./index.min.css";
import { useNavigate, useParams } from "react-router-dom";
import boardContext from "../../store/board-context";

const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);

  const {
    canvasId,
    setCanvasId,
    setElements,
    setHistory,
  } = useContext(boardContext);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchCanvases();
  }, []);

  const fetchCanvases = async () => {
    try {
      const response = await axios.get(
        "https://whiteboard-d37k.onrender.com/api/canvas/list"
      );

      setCanvases(response.data);

      // Open first canvas if no canvas is currently selected
      if (!id && response.data.length > 0) {
        setCanvasId(response.data[0]._id);
        handleCanvasClick(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching canvases:", error);
    }
  };

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post(
        "https://whiteboard-d37k.onrender.com/api/canvas/create"
      );

      console.log("Created canvas:", response.data);

      const newCanvasId = response.data.canvasId;

      setCanvasId(newCanvasId);
      setElements([]);
      setHistory([]);

      setCanvases((prev) => [
        ...prev,
        { _id: newCanvasId },
      ]);

      handleCanvasClick(newCanvasId);
    } catch (error) {
      console.error("Error creating canvas:", error);
    }
  };

  const handleDeleteCanvas = async (id) => {
    try {
      await axios.delete(
        `https://whiteboard-d37k.onrender.com/api/canvas/delete/${id}`
      );

      const updatedCanvases = canvases.filter(
        (canvas) => canvas._id !== id
      );

      setCanvases(updatedCanvases);

      if (updatedCanvases.length > 0) {
        setCanvasId(updatedCanvases[0]._id);
        handleCanvasClick(updatedCanvases[0]._id);
      } else {
        setCanvasId("");
        setElements([]);
        setHistory([]);
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting canvas:", error);
    }
  };

  const handleCanvasClick = (id) => {
    setCanvasId(id);
    navigate(`/${id}`);
  };

  return (
    <div className="sidebar">

      <button
        className="create-button"
        onClick={handleCreateCanvas}
      >
        + Create New Canvas
      </button>

      <ul className="canvas-list">
        {canvases.map((canvas) => (
          <li
            key={canvas._id}
            className={`canvas-item ${
              canvas._id === canvasId ? "selected" : ""
            }`}
          >
            <span
              className="canvas-name"
              onClick={() => handleCanvasClick(canvas._id)}
            >
              {canvas._id}
            </span>

            <button
              className="delete-button"
              onClick={() => handleDeleteCanvas(canvas._id)}
            >
              del
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Sidebar;