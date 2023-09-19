const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
//Need all feilds for this section

// The `/api/products` endpoint

router.get('/', async (req, res) => {

  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
        include: [{ model: Category }, { model: Tag }],
    });
    if (!productData) {
        res.status(404).json({ message: 'Invalid' });
        return;
    }
    res.status(200).json(productData);
} catch (err) {
    res.status(500).json(err);
}
});

router.post('/', (req, res) => {

  Product.create(
    {
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      tagIds: req.body.tag_id,
    })
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.error(err);
      res.status(400).json(err);
    });
});

router.put('/:id', async (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
  
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
  
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  Product.destroy({
    where: {
        id: req.params.id
    }
})
    .then(dbProductData => {
        if (!dbProductData) {
            res.status(404).json({ message: 'Invalid' });
            return;
        }
        res.json(dbProductData)({ message: 'Product deleted'});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
