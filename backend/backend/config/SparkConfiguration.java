package backend.config;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
public class SparkConfiguration {
    @Bean(destroyMethod = "close")
    @Lazy
    public JavaSparkContext javaSparkContext(@Value("${experiment7.spark.master:local[2]}") String master) {
        SparkConf conf = new SparkConf()
                .setAppName("distributed-computing-experiment-7")
                .setMaster(master)
                .set("spark.ui.enabled", "false")
                .set("spark.driver.host", "127.0.0.1")
                .set("spark.driver.bindAddress", "127.0.0.1");
        return new JavaSparkContext(conf);
    }
}
