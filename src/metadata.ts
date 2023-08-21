/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./lib/entities/base.entity"), { "Base": { id: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } } }], [import("./lib/entities/customer.entity"), { "Customer": { email: { required: true, type: () => String } } }], [import("./lib/entities/auth.entity"), { "AuthenticationCredentials": { authToken: { required: true, type: () => String }, refreshToken: { required: false, type: () => String, nullable: true } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String } } }]] } };
};