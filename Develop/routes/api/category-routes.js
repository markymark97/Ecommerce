const router = require('express').Router();
const { Category, Product } = require('../../models');
// Only need Category and Prodcut for this section

// The `/api/categories` endpoint

router.get('/', async (req, res) => {

  Category.findAll({
    attributes: ['id', 'category_name'],
    include: [
        {
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        }
    ]
})
    .then(dbTagData => res.json(dbTagData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
  });
  


router.get('/:id', async (req, res) => {
  Category.findOne({
    where: {
        id: req.params.id
    },
    attributes: ['id', 'category_name'],
    include: [
        {
            model: Product,
            attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        }
    ]
})
    .then(dbCategoryData => {
        if (!dbCategoryData) {
            res.status(404).json({ message: 'Invalid' });
            return;
        }
        res.json(dbCategoryData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});


router.post('/', async(req, res) => {

  // create a new category
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const categoryData = await Category.update(req.body,
      { where: { id: req.params.id },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'Invalid' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ message: 'Invalid' });
    }

    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
