export const sendToken = async (user, statusCode, message, res) => {
  // 1. Generate JWT token
  const token = await user.generateToken();

  // 2. Send JWT token
  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: true,
    })
    .json({ success: true, message, user, token });
};
