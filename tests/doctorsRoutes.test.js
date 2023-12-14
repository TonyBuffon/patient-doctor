const request = require("supertest");
const faker = require("faker");
const app = require("../index");

const mockData = {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};
describe("Sign Up API", () => {
  describe("with all data", () => {
    it("should create a new doctor", async () => {
      const res = await request(app)
        .post("/api/v1/doctors/register")
        .send(mockData);
      expect(res.statusCode).toEqual(201);
    });
  });
  describe("with missing data", () => {
    it("should return error", async () => {
      const res = await request(app).post("/api/v1/doctors/register").send({
        name: "Tony",
      });
      expect(res.statusCode).toEqual(400);
    });
  });
});
describe("Sign in API", () => {
  describe("with correct data", () => {
    it("should create a new doctor", async () => {
      const res = await request(app)
        .post("/api/v1/doctors/login")
        .send(mockData);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe("with wrong data", () => {
    it("should return error", async () => {
      const res = await request(app).post("/api/v1/doctors/login").send({
        email: "test11@example.com",
        password: "testpassworddd",
      });
      expect(res.statusCode).toEqual(400);
    });
  });
});

describe("Get Me API", () => {
  describe("with valid token", () => {
    it("should return doctor", async () => {
      const res = await request(app)
        .get("/api/v1/doctors/me")
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2EzZjVkMjFmODRhYWI0MjdmOGE3NCIsImlhdCI6MTcwMjUxMDQzMSwiZXhwIjoxNzA1MTAyNDMxfQ.RO1Ngr-oZoZ-EBv_zmLkahHDqDtLpvajTJj3n6s-iRA`
        );

      console.log(res.body);
      expect(res.statusCode).toEqual(200);
    });
  });
  describe("without token", () => {
    it("should return doctor", async () => {
      const res = await request(app).get("/api/v1/doctors/me");

      console.log(res.body);
      expect(res.statusCode).toEqual(401);
    });
  });
  describe("with wrong token", () => {
    it("should return doctor", async () => {
      const res = await request(app)
        .get("/api/v1/doctors/me")
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2EzZjVkMjFmODRhYWI0MjdmOGE3NCIsImlhdCI6MTcwMjUxMDQzMSwiZXhwIjoxNzA1MTAyNDMxfQ.RO1Ngr-oZoZ-EBv_zmLkahHDqDtLpvajTJj3n6s-ssiRA`
        );

      console.log(res.body);
      expect(res.statusCode).toEqual(401);
    });
  });
});
afterAll(() => {
  app.close();
  // app.removeListener(4000);
  app.unref();
  app.removeAllListeners();
  app.closeAllConnections();
});
