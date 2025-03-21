export const sendToken = async (user, statusCode, message, res) => {
  const token = await user.generateToken();
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
