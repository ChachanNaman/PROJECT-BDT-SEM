import os
from pyspark.sql import SparkSession, functions as F

INPUT_DIR = os.environ.get("SPARK_INPUT_DIR", "./analytics-in")
OUTPUT_DIR = os.environ.get("SPARK_OUTPUT_DIR", "./analytics-out")

spark = SparkSession.builder.appName("multirec_content_analytics").getOrCreate()

ratings = spark.read.json(f"{INPUT_DIR}/ratings.jsonl")
content = spark.read.json(f"{INPUT_DIR}/content.jsonl")

ratings = (ratings
    .withColumn("content_id", F.col("contentId").cast("string"))
    .withColumn("rating", F.col("rating").cast("double"))
    .withColumn("ts", F.to_timestamp("createdAt")))
content = (content
    .withColumn("content_id", F.col("_id").cast("string"))
    .withColumn("title", F.col("title"))
    .withColumn("type", F.col("type"))
    .withColumn("year", F.col("year").cast("int"))
    .withColumn("created_at", F.to_timestamp("createdAt")))

agg = (ratings.groupBy("content_id")
       .agg(F.count("*").alias("rating_count"),
            F.avg("rating").alias("avg_rating")))

cutoff = F.date_sub(F.current_date(), 30)
recent = (ratings.withColumn("day", F.to_date("ts"))
          .filter(F.col("day") >= cutoff)
          .groupBy("content_id")
          .agg(F.count("*").alias("ratings_30d")))

content_agg = (content.select("content_id", "title", "type", "year")
               .join(agg, "content_id", "left")
               .join(recent, "content_id", "left")
               .fillna({"avg_rating": 0.0, "rating_count": 0, "ratings_30d": 0})
               .withColumn("avg_rating", F.round(F.col("avg_rating"), 2)))

ratings_with_type = (ratings
    .join(content.select("content_id", "type"), "content_id", "left")
    .withColumn("day", F.to_date("ts")))
trends = (ratings_with_type.groupBy("day", "type")
          .agg(F.count("*").alias("rating_events"))
          .orderBy("day", "type"))

os.makedirs(OUTPUT_DIR, exist_ok=True)
(content_agg.coalesce(1).write.mode("overwrite").option("header", True).csv(f"{OUTPUT_DIR}/content_agg"))
(trends.coalesce(1).write.mode("overwrite").option("header", True).csv(f"{OUTPUT_DIR}/content_trends"))

(content_agg.coalesce(1).write.mode("overwrite").json(f"{OUTPUT_DIR}/content_agg_json"))
(trends.coalesce(1).write.mode("overwrite").json(f"{OUTPUT_DIR}/content_trends_json"))

print("Wrote analytics to", OUTPUT_DIR)
spark.stop()


