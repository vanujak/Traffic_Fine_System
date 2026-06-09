const prisma = require("../config/db");

const listDistricts = async (req, res, next) => {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
};

const getDistrictById = async (req, res, next) => {
  try {
    const district = await prisma.district.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!district) {
      return res
        .status(404)
        .json({ success: false, message: "District not found." });
    }

    return res.status(200).json({ success: true, data: district });
  } catch (error) {
    next(error);
  }
};

const createDistrict = async (req, res, next) => {
  try {
    const district = await prisma.district.create({
      data: { name: req.body.name },
    });
    return res.status(201).json({ success: true, data: district });
  } catch (error) {
    next(error);
  }
};

const updateDistrict = async (req, res, next) => {
  try {
    const district = await prisma.district.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name },
    });

    return res.status(200).json({ success: true, data: district });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
};
