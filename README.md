# WebCrawler (NSWI153)

This repository contains a solution for an assignment from the lecture **Advanced Programming of Web Applications (*NSWI153*)** at Charles University. The original assignment can be viewed in the file [original-assignment.html](./original-assignment.html).

The purpose of this README is to outline the top-level architecture and discuss some limitations and potential improvements for this solution.

## TL;DR

The project utilizes Docker containers and Docker Compose, making it fairly straightforward to compile and run the solution.

```bash 
git clone https://github.com/erunno/WebCrawler
docker compose up
```

## Components

There are three main components:

- **Backend**: Developed using C#, specifically ASP.NET, along with multiple libraries, notably HotChocolate, which was used to define the GraphQL API.
- **Database**: MySQL server was employed as the database. The backend codebase utilized Entity Framework .NET for relational mappings.
- **Frontend**: Developed using Angular along with Apollo Client, facilitating easy connection to the GraphQL API.

## Architecture

Given that the data model and webpage user interface are not overly complex, the architecture remains relatively simple. The primary business logic revolves around scheduling website crawling.

### Website Crawling

The central class orchestrating the crawling is [`ExecutionQueue`](./WebCrawler/BusinessLogic/Crawling/ExecutionQueue.cs). The entry point of this queue is the `Execute` method, which spawns a new separate thread in which the queue itself operates. Subsequently, the method simply returns.

The operation of the queue itself is also straightforward. At its core lies an infinite loop, which initially assesses the websites that need to be crawled. Once determined, the `ExecutionQueue` spawns a respective number of `Task`s - a C# concept for asynchronous execution. C# automatically creates a thread pool, and further scheduling is handled by the `Task`s themselves. Each of these tasks handles one website record; the crawling logic is managed by the [`Crawler`](./WebCrawler/BusinessLogic/Crawling/Crawler.cs) class. Once the `ExecutionQueue` spawns all tasks, it puts itself to sleep using `System.Threading.Monitor`. The time of the sleep is determined by the next closes execution. However, the `ExecutionQueue` can be awakened earlier - for instance, when a user saves a new execution record it needs to execute immediately. This is achieved using either `RequestExecutorsRun` or `RequestExecutorsRunAndGetAwaiter` - the former simply wakes up the `ExecutionQueue` and exits immediately, while the latter returns a task that completes once the cycle of `ExecutionQueue` is finished. After the returned `Task` is completed, it is guaranteed that all websites have at least one execution record in the database.

### Graph Rendering using D3.js

Integrating D3.js code into the Angular codebase presented a notable challenge. To segregate the implementation details of the graph visualization using D3.js from rest of the Angular application, a component called [`graph`](./Frontend/web-crawler/src/app/components/graph/) was developed.

- **Component Isolation**: The `graph` component encapsulates the usage of D3.js. It accepts `nodes` and `links` as inputs. Upon changes to these inputs, the component automatically assesses the modifications and initiates rendering as necessary.
- **Node Equality**: Nodes are evaluated for equality based on their `id` property. Two nodes, `node1` and `node2`, are considered equal iff `node1.id === node2.id`. This approach eliminates the need to retain references to original objects. In fact, the component creates copies of the objects to ensure immutability.

## Limitations

While the application serves its purpose, not all aspects of it are ideal, and certain decisions were made due to time constraints. Here's a non-exhaustive list of limitations and potential improvements:

- *Testing*: The primary shortcoming of the project is the complete lack of tests on both the frontend and backend. Additionally, backend services (like repositories) should have been implemented against interfaces to facilitate separate testing of classes. Once this is done, frameworks like Moq.NET can be employed for easier testing.
- *Database*: While a SQL database was chosen to save time and effort, during development it became apparent that a graph database might have been a better fit for this task.
- *Responsiveness*: The user interface of the application is relatively simple, with no specific styling for mobile devices implemented.
