const AddOn = require('../models/AddOn');

const getAllAddOns = async (req, res) => {
  try {
    const addOns = await AddOn.find({ isActive: true });
    res.json(addOns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAddOn = async (req, res) => {
  try {
    const addOn = new AddOn(req.body);
    await addOn.save();
    res.status(201).json(addOn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAddOn = async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    Object.assign(addOn, req.body);
    await addOn.save();
    res.json(addOn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAddOn = async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) {
      return res.status(404).json({ message: 'Add-on not found' });
    }
    await addOn.remove();
    res.json({ message: 'Add-on removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAddOns,
  createAddOn,
  updateAddOn,
  deleteAddOn,
};
