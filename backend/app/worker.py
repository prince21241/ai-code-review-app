import os
from rq import Worker
from rq import Queue
from rq import Connection
from redis import Redis


def main():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    conn = Redis.from_url(redis_url)
    queues = [Queue("reviews", connection=conn)]
    with Connection(conn):
        worker = Worker(queues)
        worker.work(with_scheduler=True)


if __name__ == "__main__":
    main()


