const prisma = require("../config/db");

const listActiveCategories = async (req, res, next) => {
  try {
    const categories = await prisma.fineCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await prisma.fineCategory.findFirst({
      where: { id: Number(req.params.id), isActive: true },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Fine category not found." });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, amount, description = null } = req.body;

    const category = await prisma.fineCategory.create({
      data: { name, amount: Number(amount), description, isActive: true },
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, amount, description, isActive } = req.body;

    const category = await prisma.fineCategory.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await prisma.fineCategory.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listActiveCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
