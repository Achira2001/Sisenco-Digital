// Tests for role-based access control 
const { authorize } = require("../middleware/authMiddleware");

// Create a fake Express response object
const buildMockRes = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("authorize middleware", () => {
  test("allows user when the role matches", () => {
    const req = {
      user: {
        role: "manager",
      },
    };

    const res = buildMockRes();
    const next = jest.fn();

    authorize("manager")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("blocks user when the role does not match", () => {
    const req = {
      user: {
        role: "member",
      },
    };

    const res = buildMockRes();
    const next = jest.fn();

    authorize("manager")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("manager"),
      })
    );
  });

  test("blocks request when user is missing", () => {
    const req = {};
    const res = buildMockRes();
    const next = jest.fn();

    authorize("manager")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("allows user when one of multiple roles matches", () => {
    const req = {
      user: {
        role: "member",
      },
    };

    const res = buildMockRes();
    const next = jest.fn();

    authorize("manager", "member")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("member cannot access manager-only routes", () => {
    const req = {
      user: {
        role: "member",
      },
    };

    const res = buildMockRes();
    const next = jest.fn();

    authorize("manager")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("protect middleware", () => {
  const { protect } = require("../middleware/authMiddleware");

  test("rejects request without Authorization header", async () => {
    const req = {
      headers: {},
    };

    const res = buildMockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("rejects request with an invalid token", async () => {
    process.env.JWT_SECRET = "test_secret_for_unit_tests";

    const req = {
      headers: {
        authorization: "Bearer not-a-real-token",
      },
    };

    const res = buildMockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});