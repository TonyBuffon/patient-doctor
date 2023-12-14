const request = require("supertest");
const faker = require("faker");
const app = require("../index");

const mockData = {
  name: faker.name.findName(),
  email: faker.internet.email(),
  medicalHistory: faker.lorem.words(2),
  diagnoses: faker.lorem.words(2),
  notes: faker.lorem.words(2),
  drugs: faker.lorem.words(2),
};
let mockID;
describe("create API", () => {
  describe("with all data", () => {
    it("should create a new patient", async () => {
      console.log(mockData);
      const res = await request(app)
        .post("/api/v1/patients/create")
        .send(mockData)
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2EzZjVkMjFmODRhYWI0MjdmOGE3NCIsImlhdCI6MTcwMjUxMDQzMSwiZXhwIjoxNzA1MTAyNDMxfQ.RO1Ngr-oZoZ-EBv_zmLkahHDqDtLpvajTJj3n6s-iRA`
        );
      console.log(res.body);
      mockID = res.body.patient.id;
      expect(res.statusCode).toEqual(200);
    });
  });
  describe("with missing data", () => {
    it("should return error", async () => {
      const res = await request(app)
        .post("/api/v1/patients/create")
        .send({
          name: "Tony",
        })
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2EzZjVkMjFmODRhYWI0MjdmOGE3NCIsImlhdCI6MTcwMjUxMDQzMSwiZXhwIjoxNzA1MTAyNDMxfQ.RO1Ngr-oZoZ-EBv_zmLkahHDqDtLpvajTJj3n6s-iRA`
        );
      expect(res.statusCode).toEqual(400);
    });
  });
  describe("without doctor token", () => {
    it("should return error", async () => {
      const res = await request(app).post("/api/v1/patients/create").send({
        name: "Tony",
      });
      expect(res.statusCode).toEqual(401);
    });
  });
});
describe("Sign in API", () => {
  describe("with correct data", () => {
    it("should create a new doctor", async () => {
      const res = await request(app)
        .post("/api/v1/patients/login")
        .send(mockData);
      expect(res.statusCode).toEqual(400);
    });
  });
  describe("with wrong data", () => {
    it("should return error", async () => {
      const res = await request(app).post("/api/v1/patients/login").send({
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

      expect(res.statusCode).toEqual(401);
    });
  });
});

describe("Update Patient", () => {
  describe("Correct update", () => {
    it("should update the patient with sent data", async () => {
      const res = await request(app)
        .patch(`/api/v1/patients/one/${mockID}`)
        .send(mockData)
        .set(
          "Authorization",
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1N2EzZjVkMjFmODRhYWI0MjdmOGE3NCIsImlhdCI6MTcwMjUxMDQzMSwiZXhwIjoxNzA1MTAyNDMxfQ.RO1Ngr-oZoZ-EBv_zmLkahHDqDtLpvajTJj3n6s-iRA`
        );
    });
  });
});

afterAll(() => {
  // app.close();
  app.unref();
  // app.off();
  // app.removeListener(4000);
  app.removeAllListeners();
  if (app) {
    app.close();
  }
  app.closeAllConnections();
});
