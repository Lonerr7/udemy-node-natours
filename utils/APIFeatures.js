exports.APIFeatures = {
  filterByQuery(queryObj, prevQuery) {
    const queryStr = JSON.stringify(queryObj);
    const replacedQueryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (substr) => `$${substr}`
    );

    return prevQuery.find(JSON.parse(replacedQueryStr));
  },
  sortByQuery(sort, prevQuery) {
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      return prevQuery.sort(sortBy);
    }

    return prevQuery.sort('-createdAt _id');
  },
  chooseFieldsByQuery(fields, prevQuery) {
    if (fields) {
      const limitByFileds = fields.split(',').join(' ');
      return prevQuery.select(limitByFileds);
    }
    return prevQuery.select('-__v');
  },
  async paginate(page, limit, prevQuery, Model) {
    const queriedPage = +page || 1;
    const queriedLimit = +limit || 3;
    const skip = (queriedPage - 1) * queriedLimit;

    if (page) {
      const toursCount = await Model.countDocuments();
      if (skip >= toursCount) throw new Error('The page does not exist');
    }

    return prevQuery.skip(skip).limit(queriedLimit);
  },
};
