const router = require("express").Router();
const auth = require("../../../middlewares/auth");
const {
  assignTableToUser,
  getAvailableTables,
  addItemsToOrder,
  removeOrderItem,
  getOrderItems,
  updateItemStatus
} = require("./deliveryAgentController");

router.post("/assigntable", auth, assignTableToUser);
router.get("/availableTable", auth, getAvailableTables);
router.post("/addItemsToOrder", auth, addItemsToOrder);
router.post("/updateItemStatus", auth, updateItemStatus);
router.get("/getOrderItems/:tableNo", auth, getOrderItems);
router.post("/removeOrderItem", auth, removeOrderItem);
module.exports = router;
