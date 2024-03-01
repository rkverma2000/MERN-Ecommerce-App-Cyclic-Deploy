import userModel from "../model/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../model/orderModel.js"

const registerController = async (req, res) => {

    try {

        const { fName, lName, emailId, phoneNo, address, answer, password } = req.body

        if (!fName) {
            return res.send({ message: "first name is required" });
        }
        if (!lName) {
            return res.send({ message: "last name name is required" });
        }
        if (!emailId) {
            return res.send({ message: "email id is required" });
        }
        if (!phoneNo) {
            return res.send({ message: "phone no is required" });
        }
        if (!address) {
            return res.send({ message: "address is required" });
        }
        if (!answer) {
            return res.send({ message: "answer is required" });
        }
        if (!password) {
            return res.send({ message: "password is required" });
        }

        const existingUser = await userModel.findOne({ emailId });

        if (existingUser) {
            return res.status(200).send({
                success: true,
                message: "Already registered please login",
            })
        }

        const user = await new userModel({ fName, lName, emailId, phoneNo, address, answer, password }).save();

        res.status(201).send({
            success: true,
            message: "user registered succesfully",
            user
        })

    } catch (error) {

        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in registration",
            error
        })

    }

}

const loginController = async (req, res) => {

    try {

        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(404).send({
                success: false,
                message: "invalid email id or password"
            })
        }

        const user = await userModel.findOne({ emailId });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "email is not registered"
            })
        }

        if (password === user.password) {

            const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

            return res.status(200).send({
                success: true,
                message: "login successful",
                user: {
                    fName: user.fName,
                    lName: user.lName,
                    emailId: user.emailId,
                    phoneNo: user.phoneNo,
                    address: user.address,
                    role: user.role
                }, token
            });
        } else {
            return res.status(200).send({
                success: false,
                message: "invalid password"
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in login",
            error
        })
    }

}

const forgotPasswordController = async (req, res) => {
    try {

        const { emailId, answer, newPassword } = req.body;

        if (!emailId) {
            res.status(400).send({ message: "email is required" });
        }
        if (!answer) {
            res.status(400).send({ message: "answer is required" });
        }
        if (!newPassword) {
            res.status(400).send({ message: "new password is required" })
        }
        const user = await userModel.findOne({ emailId, answer });
        if (!user) {
            res.status(404).send({
                success: false,
                message: "wrong email or answer"
            });
        }
        await userModel.findByIdAndUpdate(user._id, { password: newPassword });
        res.status(200).send({
            success: true,
            message: "succesfully reset password"
        })
    } catch (error) {

        console.log(error);
        res.status(500).send({
            success: false,
            message: "something went wrong",
            error
        })

    }
}

const updateProfileController = async (req, res) => {

    try {
        const { fname, lName, emailId, phoneNo, address } = req.body
        const user = await userModel.findById(req.user._id);

        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            fName: fname || user.fName,
            lName: lName || user.lName,
            phoneNo: phoneNo || user.phoneNo,
            address: address || user.address
        }, { new: true });

        res.status(200).send({
            success: true,
            message: "profile updated successfully",
            updatedUser
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error while updating profile"
        })

    }

}

const getOrdersController = async (req, res) => {
    try {

        const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate('buyer', 'name')
        res.json(orders)


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'error while getting orders',
            error
        })

    }
}


const getAdminOrdersController = async (req, res) => {
    try {

        const orders = await orderModel.find({}).populate("products", "-photo").populate('buyer', 'name')
        res.json(orders)


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'error while getting orders',
            error
        })

    }
}

const orderStatusController = async (req, res) => {
    try {

        const { orderId } = req.params
        const { status } = req.body

        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders)

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'error while updating order',
            error
        })

    }
}

export {
    registerController,
    loginController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAdminOrdersController,
    orderStatusController
};