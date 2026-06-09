const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          district: true,
          officer: { include: { district: true } },
        },
      }),
      prisma.user.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        district: true,
        officer: { include: { district: true } },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone = null,
      districtId = null,
      badgeNo = null,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        districtId: districtId ? Number(districtId) : null,
      },
    });

    if (role === "OFFICER") {
      if (!badgeNo || !phone || !districtId) {
        return res.status(400).json({
          success: false,
          message: "Officer creation requires badgeNo, phone and districtId.",
        });
      }

      await prisma.officer.create({
        data: {
          userId: user.id,
          badgeNo,
          phone,
          districtId: Number(districtId),
        },
      });
    }

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, districtId, role, badgeNo } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { officer: true },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(districtId !== undefined
          ? { districtId: districtId === null ? null : Number(districtId) }
          : {}),
        ...(role !== undefined ? { role } : {}),
      },
    });

    if (role === "OFFICER") {
      if (!phone && !existingUser.phone && !existingUser.officer?.phone) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Officer update requires a phone number.",
          });
      }

      if (
        !districtId &&
        !existingUser.districtId &&
        !existingUser.officer?.districtId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Officer update requires a districtId.",
          });
      }

      const officerData = {
        phone: phone ?? existingUser.officer?.phone ?? existingUser.phone,
        districtId: districtId
          ? Number(districtId)
          : (existingUser.officer?.districtId ?? existingUser.districtId),
      };

      if (existingUser.officer) {
        await prisma.officer.update({
          where: { userId: id },
          data: {
            ...officerData,
            ...(badgeNo ? { badgeNo } : {}),
          },
        });
      } else {
        if (!badgeNo) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Creating an officer profile requires badgeNo.",
            });
        }

        await prisma.officer.create({
          data: {
            userId: id,
            badgeNo,
            phone: officerData.phone,
            districtId: officerData.districtId,
          },
        });
      }
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false, refreshToken: null },
    });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
