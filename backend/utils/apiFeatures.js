class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    const keyword = this.queryString.keyword
      ? { name: { $regex: this.queryString.keyword, $options: 'i' } }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryString };
    const removeFields = ['keyword', 'page', 'limit', 'sort'];
    removeFields.forEach((el) => delete queryCopy[el]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(resPerPage = 10) {
    const currentPage = Number(this.queryString.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
