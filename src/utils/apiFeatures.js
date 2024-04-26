

class ApiFeatures {

    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData
    }

    paginate() {
        let { size, page } = this.queryData

        if (!size || size <= 0) {
            size = 1
        }

        if (!page || page <= 0) {
            page = 1
        }
        this.mongooseQuery.limit(parseInt(size)).skip((parseInt(page) - 1) * parseInt(size))
        return this
    }

    filter() {
        const excludsQueryParams = ['page', 'size', 'sort', 'fields', 'search']
        const fillterQuery = { ...this.queryData }
        excludsQueryParams.forEach(param => {
            delete fillterQuery[param]
        })
        this.mongooseQuery.find(JSON.parse(JSON.stringify(fillterQuery).replace(/gt|gte|lt|lte|in|nin|eq|neq/g, match => `$${match}`)))
        return this
    }

    sort() {
        this.mongooseQuery.sort(this.queryData.sort?.replaceAll(",", ' '))
        return this
    }

    search() {
        this.mongooseQuery.find({
            $or: [
                { name: { $regex: this.queryData.search, $options: "i" } },
                { description: { $regex: this.queryData.search, $options: "i" } },
            ]
        })//search
        return this
    }

    select() {
        this.mongooseQuery.select(this.queryData.fields?.replaceAll(',' , ' '))
        return this
    }
}


export default ApiFeatures







