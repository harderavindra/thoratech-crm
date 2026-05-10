import jwt, {
  type Secret,
  type SignOptions,
} from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET as Secret;

export const signToken = (
  payload: object
) => {
  const options: SignOptions = {
    expiresIn: "30m",
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    options
  );
};