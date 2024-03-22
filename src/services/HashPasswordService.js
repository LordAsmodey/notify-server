import bcrypt from "bcrypt";

class HashPasswordService {
  static generateHash(password) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  static comparePasswords(inputPassword, hashedPassword) {
    return bcrypt.compareSync(inputPassword, hashedPassword);
  }
}

export default HashPasswordService;
