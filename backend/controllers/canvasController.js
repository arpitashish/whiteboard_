const Canvas = require("../models/canvasModel");

// Create a new canvas
exports.createCanvas = async (req, res) => {
    try {
        const newCanvas = new Canvas({
            elements: [],
        });

        await newCanvas.save();

        res.status(201).json({
            message: "Canvas created successfully",
            canvasId: newCanvas._id,
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to create canvas",
            details: error.message,
        });
    }
};

// Update an existing canvas
exports.updateCanvas = async (req, res) => {
    try {
        const { canvasId, elements } = req.body;

        const canvas = await Canvas.findById(canvasId);

        if (!canvas) {
            return res.status(404).json({
                error: "Canvas not found",
            });
        }

        canvas.elements = elements;

        await canvas.save();

        res.json({
            message: "Canvas updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update canvas",
            details: error.message,
        });
    }
};

// Load a canvas
exports.loadCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;

        const canvas = await Canvas.findById(canvasId);

        if (!canvas) {
            return res.status(404).json({
                error: "Canvas not found",
            });
        }

        res.json(canvas);
    } catch (error) {
        res.status(500).json({
            error: "Failed to load canvas",
            details: error.message,
        });
    }
};

// Delete a canvas
exports.deleteCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;

        const canvas = await Canvas.findById(canvasId);

        if (!canvas) {
            return res.status(404).json({
                error: "Canvas not found",
            });
        }

        await Canvas.findByIdAndDelete(canvasId);

        res.json({
            message: "Canvas deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete canvas",
            details: error.message,
        });
    }
};

// Get all canvases
exports.getUserCanvases = async (req, res) => {
    try {
        const canvases = await Canvas.find({})
            .sort({ createdAt: -1 });

        res.json(canvases);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch canvases",
            details: error.message,
        });
    }
};