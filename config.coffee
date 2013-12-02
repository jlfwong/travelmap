exports.config =
    files:
        javascripts:
            joinTo:
                'app.js': /^app/
                'vendor.js': /^vendor/
                'test/test.js': /^test(\/|\\)(?!vendor)/
                'test/test-vendor.js': /^test(\/|\\)(?=vendor)/

        stylesheets:
            joinTo: 'stylesheets/app.css'
            order:
                before: ['vendor/styles/normalize.css']
                after: ['vendor/styles/helpers.css']

        templates:
            joinTo: 'app.js'

    conventions:
        # Makes test code "vendor" so they don't all needed to be manually
        # require()'d
        vendor: /(vendor|test)(\/|\\)/
